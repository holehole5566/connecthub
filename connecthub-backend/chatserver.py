import socketio
import asyncpg
import uuid
import logging
from datetime import datetime
import os
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode='asgi')
app = socketio.ASGIApp(sio, other_asgi_app=None)

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")
    try:
        # Log connection details
        user_agent = environ.get('HTTP_USER_AGENT', 'Unknown')
        logger.info(f"Connection details - SID: {sid}, User-Agent: {user_agent}")
    except Exception as e:
        logger.error(f"Error logging connection details: {e}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    try:
        match_id = data['match_id']
        user_id = data['user_id']
        
        logger.info(f"Join room request - SID: {sid}, User: {user_id}, Match: {match_id}")
        
        await sio.enter_room(sid, match_id)
        logger.info(f"User {user_id} successfully joined room {match_id}")
        
    except KeyError as e:
        logger.error(f"Missing required field in join_room: {e}")
        await sio.emit('error', {'message': f'Missing field: {e}'}, room=sid)
    except Exception as e:
        logger.error(f"Error in join_room: {e}")
        await sio.emit('error', {'message': 'Failed to join room'}, room=sid)

@sio.event
async def send_message(sid, data):
    try:
        match_id = data['match_id']
        from_user_id = data['from_user_id']
        text = data['text']
        
        logger.info(f"Message request - SID: {sid}, User: {from_user_id}, Match: {match_id}, Text: {text[:50]}...")
        
        if not text.strip():
            logger.warning(f"Empty message from user {from_user_id}")
            await sio.emit('error', {'message': 'Message cannot be empty'}, room=sid)
            return
            
        message_id = str(uuid.uuid4())
        
        DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://connecthub_user:your_password_here@localhost:5432/connecthub_db")
        
        try:
            conn = await asyncpg.connect(DATABASE_URL)
            logger.debug(f"Database connected for message {message_id}")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            await sio.emit('error', {'message': 'Database connection failed'}, room=sid)
            return
            
        try:
            await conn.execute(
                "INSERT INTO messages (id, match_id, from_user_id, text) VALUES ($1, $2, $3, $4)",
                message_id, match_id, from_user_id, text
            )
            logger.debug(f"Message inserted: {message_id}")
            
            await conn.execute(
                "UPDATE matches SET last_message_id = $1 WHERE id = $2",
                message_id, match_id
            )
            logger.debug(f"Match updated with last message: {match_id}")
            
        except Exception as e:
            logger.error(f"Database operation failed: {e}")
            await sio.emit('error', {'message': 'Failed to save message'}, room=sid)
            return
        finally:
            await conn.close()
            logger.debug("Database connection closed")
        
        message = {
            'id': message_id,
            'type': 'message',
            'match_id': match_id,
            'from_user_id': from_user_id,
            'text': text,
            'sent_at': datetime.now().isoformat()
        }
        
        await sio.emit('new_message', message, room=match_id)
        logger.info(f"Message broadcast successfully: {message_id}")
        
    except KeyError as e:
        logger.error(f"Missing required field in send_message: {e}")
        await sio.emit('error', {'message': f'Missing field: {e}'}, room=sid)
    except Exception as e:
        logger.error(f"Unexpected error in send_message: {e}")
        await sio.emit('error', {'message': 'Internal server error'}, room=sid)

if __name__ == '__main__':
    logger.info("Starting Socket.IO chat server on port 8765")
    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")