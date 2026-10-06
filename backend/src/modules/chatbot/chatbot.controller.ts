import { Request, Response } from 'express';
import { generateChatReply } from './chatbot.service';

export async function chatWithAssistant(
    req: Request,
    res: Response
) {
    try {
        const { message } = req.body ?? {};

        if (
            !message ||
            typeof message !== 'string' ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
                errors: null,
            });
        }

        const cleanMessage = message.trim();

        if (cleanMessage.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Message must be 1000 characters or fewer',
                errors: null,
            });
        }

        const reply = await generateChatReply(cleanMessage);

        return res.status(200).json({
            success: true,
            message: 'Chat response generated',
            data: {
                reply,
            },
        });
    } catch (error) {
        console.error('[chatbot]', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to process your message right now.',
            errors: null,
        });
    }
}