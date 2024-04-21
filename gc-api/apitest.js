// require('dotenv').config();
// const express = require('express');
// const axios = require('axios');
// const { createClient } = require('@supabase/supabase-js');
// const bodyParser = require('body-parser');
//
// const app = express();
// app.use(bodyParser.json());
//
//
// const recipientId = "7453033561398045";
// const PAGE_ACCESS_TOKEN = "EAAFAT0Q3FOQBO8SZBE6EQrPOVGYrZA3DQNhKFVb5cvU83HNW2qI8ZCRC4QzvrZCLvvjefZCD0JSkAXZAjrjVcJrjOZA92GKg3GQRe4BeZBFwAWJtXigjgdTtuhvhSQkCdUahoK4v8qk94TdNsKRveYkjOAwpO1iiTx63uz7u48s2NuuCuZCHWMSFqR8ZCR3Y5ZAlPyc";
//
//
// async function getConversationIdByRecipientId(recipientId, pageAccessToken) {
//     const url = `https://graph.facebook.com/v14.0/me/conversations?access_token=${pageAccessToken}&fields=participants`;
//     try {
//         const response = await axios.get(url);
//         const conversations = response.data.data;
//
//         for (let conversation of conversations) {
//             const participants = conversation.participants.data;
//             if (participants.some(participant => participant.id === recipientId)) {
//                 return conversation.id;
//             }
//         }
//
//         return null;
//     } catch (error) {
//         console.error('Failed to fetch conversations:', error);
//         return null;
//     }
// }
//
// async function fetchChatHistory(conversationId, accessToken) {
//     const url = `https://graph.facebook.com/v14.0/${conversationId}/messages?access_token=${accessToken}`;
//     try {
//         const response = await axios.get(url);
//         return response.data;
//     } catch (error) {
//         console.error('Failed to fetch chat history:', error);
//         return null;
//     }
// }
//
// async function run() {
//     const conversationId = await getConversationIdByRecipientId(recipientId, PAGE_ACCESS_TOKEN);
//     if (conversationId) {
//         const chatHistory = await fetchChatHistory(conversationId, PAGE_ACCESS_TOKEN);
//         console.log('Chat History:', chatHistory);
//     } else {
//         console.log('Conversation not found for the given recipient ID.');
//     }
// }
//
// run();
const axios = require('axios');

const PAGE_ID = "61555697914104";
const RECIPIENT_ID = "7453033561398045";
const PAGE_ACCESS_TOKEN = "EAAFAT0Q3FOQBO8SZBE6EQrPOVGYrZA3DQNhKFVb5cvU83HNW2qI8ZCRC4QzvrZCLvvjefZCD0JSkAXZAjrjVcJrjOZA92GKg3GQRe4BeZBFwAWJtXigjgdTtuhvhSQkCdUahoK4v8qk94TdNsKRveYkjOAwpO1iiTx63uz7u48s2NuuCuZCHWMSFqR8ZCR3Y5ZAlPyc";

async function getConversationId(pageId, recipientId, accessToken) {
    const url = `https://graph.facebook.com/v14.0/${pageId}/conversations?user_id=${recipientId}&access_token=${accessToken}`;

    try {
        const response = await axios.get(url);
        const conversations = response.data.data;

        if (conversations.length > 0) {
            // Assuming the first conversation is the one you need
            return conversations[0].id;
        } else {
            console.log('No conversations found with the given user.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching conversation ID:', error);
        return null;
    }
}

async function getMessages(conversationId, accessToken) {
    const url = `https://graph.facebook.com/v14.0/${conversationId}/messages?access_token=${accessToken}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return null;
    }
}

async function fetchConversation() {
    const conversationId = await getConversationId(PAGE_ID, RECIPIENT_ID, PAGE_ACCESS_TOKEN);

    if (conversationId) {
        const messages = await getMessages(conversationId, PAGE_ACCESS_TOKEN);
        console.log('Messages:', messages);
    }
}

fetchConversation();
