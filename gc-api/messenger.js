// require('dotenv').config();
// const express = require('express');
// const axios = require('axios');
// const { createClient } = require('@supabase/supabase-js');
// const bodyParser = require('body-parser');
//
// const app = express();
// app.use(bodyParser.json());
//
// const SUPABASE_URL = 'https://dxmzmtoouezxuznzjsfg.supabase.co';
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bXptdG9vdWV6eHV6bnpqc2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg1ODYyMzcsImV4cCI6MjAyNDE2MjIzN30.k9o563MhRaM1QSeKPTUGPee7rivhUe2u6HF1k0dwYRY";
//
// const VERIFY_TOKEN = "1234";
// const PAGE_ACCESS_TOKEN = 'EAAKe6JxLoNgBO8qOlhu2T4CZAlxfSHJBFi8Pb0NdG5z7ZC2rEb7FPw6afBBphuYPcZCcbPgal49U2qOffzi8q9djo2K5kgqFnaVJK5PgxcxjmH5ZC6YkGAaXBNADvgVQy1aCzfSwpYNuXEACXJQfH4Bh9nidmqMAuMrwCGFmdWE1UU1XOmNX3i3jXww5K18vYMwcN4ZAVNAVkoZBXw';
//
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
//
// let livehandoff = false;
//
// app.get('/webhook', (req, res) => {
//     if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
//         if (req.query['hub.verify_token'] !== VERIFY_TOKEN) {
//             return res.status(403).send('Verification token mismatch');
//         }
//         return res.status(200).send(req.query['hub.challenge']);
//     }
//     res.send('Hello world');
// });
//
// app.post('/webhook', async (req, res) => {
//     const data = req.body;
//     if (data.object === 'page') {
//         for (const entry of data.entry) {
//             for (const messagingEvent of entry.messaging) {
//                 if (messagingEvent.message && !messagingEvent.message.is_echo) {
//                     const senderId = messagingEvent.sender.id;
//                     const messageText = messagingEvent.message.text;
//
//                     const user_details = await getUserDetails(senderId, PAGE_ACCESS_TOKEN);
//                     const senderName = `${user_details.first_name} ${user_details.last_name}`;
//
//                     await insertOrUpdateUserChatHistory(senderId, messageText, "customer", senderName);
//                     await sendMessage(senderId, messageText);
//                 }
//             }
//         }
//     }
//     res.send('OK');
// });
//
// async function getUserDetails(userId, accessToken) {
//     const response = await axios.get(`https://graph.facebook.com/${userId}?fields=first_name,last_name,profile_pic&access_token=${accessToken}`);
//     return response.data;
// }
//
// async function sendMessage(recipientId, messageText) {
//     if (!livehandoff) {
//         const response = await axios.post(`https://general-runtime.voiceflow.com/state/user/${recipientId}/interact?logs=off`, {
//             action: {
//                 type: "text",
//                 payload: messageText
//             },
//             config: {
//                 tts: false,
//                 stripSSML: true,
//                 stopAll: true,
//                 excludeTypes: ["block", "debug", "flow"]
//             }
//         }, {
//             headers: {
//                 "Authorization": "VF.DM.65d975f165c838edf8756cd5.iLlfpkhepev5GMTv"
//             }
//         });
//
//         if (response.status === 200) {
//             const response_data = response.data;
//             console.log(response_data);
//
//             for (const item of response_data) {
//                 if (item.type === 'text' && item.payload && item.payload.message) {
//                     const messageToSend = item.payload.message;
//                     await axios.post(`https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
//                         recipient: { id: recipientId },
//                         message: { text: messageToSend }
//                     });
//                     await insertOrUpdateUserChatHistory(recipientId, messageToSend, "agent");
//                 } else if (item.type === 'live_agent') {
//                     console.log('Live agent triggered');
//                     try {
//                         // Retrieve the user's chat history from the contactList table
//                         const { data: userData, error: userError } = await supabase
//                             .from('contactList')
//                             .select('chathistory')
//                             .eq('userid', recipientId)
//                             .single();
//
//                         if (userError) throw userError;
//
//                         // Log the chat history
//                         // console.log('Chat history for handoff:', userData.chathistory);
//
//                         // Insert the handoff request into the messages table
//                         const { data: insertData, error: insertError } = await supabase.from('messages').insert([
//                             {
//                                 content: 'User requested live agent handoff via hello trigger',
//                                 userid: recipientId,
//                                 type: 'handoff_request',
//                                 read: false,
//                                 chathistory: userData.chathistory, // Include the retrieved chat history
//                             },
//                         ]);
//
//                         livehandoff = true;
//                         await fetchAndSubscribeMessages(recipientId);
//                         if (insertError) throw insertError;
//                         console.log('Handoff request sent:', insertData);
//                     } catch (error) {
//                         console.error('Error processing live agent handoff:', error);
//                     }
//                 }
//             }
//         }
//     } else {
//         console.log("Live handoff is active update message from customer:", messageText);
//         await updateChatHistoryWithNewMessage(recipientId, messageText);
//     }
// }
//
// async function insertOrUpdateUserChatHistory(userId, messageText, sender, userName = null) {
//     let { data, error } = await supabase.from('contactList').select('*').eq('userid', userId);
//
//     const chatHistoryEntry = {
//         from: sender,
//         message: messageText,
//         timestamp: new Date().toISOString(),
//     };
//
//     if (data && data.length > 0) {
//         const user_data = data[0];
//         const existingChatHistory = user_data.chathistory || [];
//         const updatedChatHistory = [...existingChatHistory, chatHistoryEntry];
//
//         let updateData = { chathistory: updatedChatHistory };
//         if (userName) {
//             updateData.name = userName;
//         }
//
//         const { error: updateError } = await supabase.from('contactList').update(updateData).eq('userid', userId);
//         if (updateError) {
//             console.error('Failed to update user data:', updateError.message);
//         } else {
//             console.log('User data updated successfully');
//         }
//     } else {
//         const userData = {
//             userid: userId,
//             chathistory: [chatHistoryEntry],
//         };
//         if (userName) {
//             userData.name = userName;
//         }
//
//         const { error: insertError } = await supabase.from('contactList').insert([userData]);
//         if (insertError) {
//             console.error('Failed to insert user:', insertError.message);
//         } else {
//             console.log('User inserted successfully');
//         }
//     }
// }
//
//
// let channel;
// const fetchAndSubscribeMessages = async (recipientId) => {
//     if (livehandoff) {
//         channel = supabase
//             .channel('public:messages')
//             .on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'messages'}, (payload) => {
//                 console.log('New insert:', payload.new);
//             })
//             .on(
//                 'postgres_changes',
//                 {event: 'UPDATE', schema: 'public', table: 'messages', filter: `userid=eq.${recipientId}`},
//                 async (payload) => {
//                     console.log('New update:', payload.new);
//                     const {chathistory} = payload.new;
//                     if (chathistory && chathistory.length > 0) {
//                         console.log('Chat History:', chathistory);
//                         const lastMessage = chathistory[chathistory.length - 1];
//                         if (lastMessage.from === 'agent') {
//                             console.log(`Message from agent: ${lastMessage.message}`);
//                             await axios.post(`https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
//                                 recipient: {id: recipientId},
//                                 message: {text: lastMessage.message}
//                             });
//                         }
//                     }
//                 }
//             )
//             .subscribe();
//     }
//
//     // Store the subscription so you can remove it later if needed
//     // e.g., channel.unsubscribe()
// };
//
// // To subscribe, call the function with the recipientId
// const updateChatHistoryWithNewMessage = async (userId, newMessage) => {
//     // Fetch the current chat history for the user
//     const { data, error: fetchError } = await supabase.from('messages').select('id, chathistory').eq('userid', userId).single(); // Assuming each user has a single row in this table
//
//     if (fetchError) {
//         console.error('Error fetching chat history:', fetchError);
//         return;
//     }
//
//     // Append the new message to the chat history
//     const updatedChatHistory = [
//         ...(data.chathistory || []), // Ensure there's a fallback in case chathistory is null
//         {
//             from: 'customer',
//             message: newMessage,
//             timestamp: new Date().toISOString(),
//         },
//     ];
//
//     // Update the chat history in the database
//     const { error: updateError } = await supabase.from('messages').update({ chathistory: updatedChatHistory }).eq('id', data.id); // Assuming `id` is the primary key for the messages table
//
//     if (updateError) {
//         console.error('Error updating chat history:', updateError);
//     } else {
//         console.log('Chat history updated successfully');
//     }
// };
//
//
// app.listen(8081, () => {
//     console.log('Server is running on port 8081');
// });
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "1234";
// const PAGE_ACCESS_TOKEN = 'EAAKe6JxLoNgBO8qOlhu2T4CZAlxfSHJBFi8Pb0NdG5z7ZC2rEb7FPw6afBBphuYPcZCcbPgal49U2qOffzi8q9djo2K5kgqFnaVJK5PgxcxjmH5ZC6YkGAaXBNADvgVQy1aCzfSwpYNuXEACXJQfH4Bh9nidmqMAuMrwCGFmdWE1UU1XOmNX3i3jXww5K18vYMwcN4ZAVNAVkoZBXw';
// const PAGE_ACCESS_TOKEN = 'EAAKe6JxLoNgBO8ica9doArYmM3mZAVK7apIe9OVzhLI1PVVndaOIOL6nJfaVhc6kykUnNjiXAnSZAUdpJRB8n9nqQtR1hnlvFkojP2LBhCsvCJZA4C9eBcKcDI1f8ZCdPjExE6S9SK3oNgs4Mz1mWAQkZBD6WerW0GKWWZCZCGHXZBRFLVeIbtUPJZCAWHfGb4Vu4ZBwDIAQj0TenPX0twkalj6yduXxqzZBK0ZD';
const PAGE_ACCESS_TOKEN = 'EAAKe6JxLoNgBO9PGG1P2vIGvroNgUIs64hLs1rZAESDF6CMUdIjvEe33zVZAb2DvbOFOcSuuuOPu4XcZBXpwtYLFS4gwpVpHGoFJl2HvZBDPlODincPQ7tZA6o8qwh2PaeOeUWGBYDWWmOhuuOZCZBfp6nF5YKAdKRBfWrU404jRDq5AIMh3wOEszXMnkMZBXsIsaiA43Jep\n';

app.get('/webhook', (req, res) => {
    // Validate the webhook subscription challenge
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
        if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
            return res.status(200).send(req.query['hub.challenge']);
        } else {
            return res.status(403).send('Verification token mismatch');
        }
    }
    res.send('Hello world');
});

app.post('/webhook', (req, res) => {
    const data = req.body;
    if (data.object === 'page') {
        data.entry.forEach(entry => {
            entry.messaging.forEach(messagingEvent => {
                if (messagingEvent.message && !messagingEvent.message.is_echo) {
                    const senderId = messagingEvent.sender.id;
                    const messageText = messagingEvent.message.text;

                    console.log(`Received message from ${senderId}: ${messageText}`);
                    sendMessage(senderId, messageText);
                }
            });
        });
    }
    res.status(200).send('EVENT_RECEIVED');
});

async function sendMessage(recipientId, messageText) {
    try {
        const response = await axios.post(`https://graph.facebook.com/v2.6/me/messages`, {
            recipient: { id: recipientId },
            message: { text: messageText }
        }, {
            params: { access_token: PAGE_ACCESS_TOKEN },
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Message sent successfully:', response.data);
    } catch (error) {
        console.error('Failed to send message:', error.response ? error.response.data : error.message);
    }
}

app.listen(8081, () => {
    console.log('Server is running on port 8081');
});
