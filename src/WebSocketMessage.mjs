export default class WebSocketMessage {
    constructor(data) {
        if (data) {
            this.metadata = {
                "message_id": data?.metadata?.message_id,
                "message_type": data?.metadata?.message_type,
                "message_timestamp": data?.metadata?.message_timestamp
            },
            this.payload = {
                "session": {
                    "id": data?.payload?.session?.id,
                    "status": data?.payload?.session?.status,
                    "connected_at": data?.payload?.session?.connected_at,
                    "keepalive_timeout_seconds": data?.payload?.session?.keepalive_timeout_seconds,
                    "reconnect_url": data?.payload?.session?.reconnect_url
                }
            }
        }
    }
}
