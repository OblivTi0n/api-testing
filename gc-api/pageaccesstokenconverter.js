const axios = require('axios');
const {get} = require("axios");

async function getLongLivedTokens(userId, shortLivedAccessToken) {
    // Step 1: Convert short-lived user access token to a long-lived user access token
    const appId = '737671845224664'; // Replace with your Facebook App ID
    const appSecret = '891db08976f9a54817f727c343d9805a'; // Replace with your Facebook App Secret

    try {
        const longLivedUserTokenResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: appId,
                client_secret: appSecret,
                fb_exchange_token: shortLivedAccessToken
            }
        });

        const longLivedUserAccessToken = longLivedUserTokenResponse.data.access_token;
        console.log('Long-lived User Access Token:', longLivedUserAccessToken);
        console.log('Full response:', longLivedUserTokenResponse);

        // Step 2: Use the long-lived user access token to get a long-lived page access token
        const pageAccessTokenResponse = await axios.get(`https://graph.facebook.com/v19.0/${userId}/accounts`, {
            params: {
                access_token: longLivedUserAccessToken
            }
        });

        const pageAccessTokens = pageAccessTokenResponse.data.data; // Array of page tokens
        console.log('Page Access Tokens:', pageAccessTokens);
        console.log('Full response:', pageAccessTokenResponse);

        return {
            longLivedUserAccessToken,
            pageAccessTokens
        };
    } catch (error) {
        console.error('Error getting tokens:', error.response ? error.response.data : error.message);
        throw error; // Rethrow the error for further handling if needed
    }
}

getLongLivedTokens(3624188694488287,"EAAKe6JxLoNgBOxhjRttY5IUzXRd2fyrjOuqdZAql0N7AHfVMUIHpNZAdTz6zEJeuEwZCetBIxuLFloVbZA7C5XWZC48wKcZBxKIlCPT9CMXNdYERTOLy5Puj9P4xq3RpTHwlXczeDm5CvYp2YefWR8QBhi1VJfqmaRIWmx3Ph18nufuPQHOZApZAK0XyffhK1hsYPgYBJLJdeFxAVnPGwgZDZD")