import { NextRequest } from 'next/server';

// Get environment variables
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn('GitHub OAuth credentials not found in environment variables');
}

export function getGitHubAuthUrl(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID!,
    redirect_uri: `${baseUrl}/api/auth/github/callback`,
    scope: 'user:email',
    state: JSON.stringify({ 
      mode: 'signin', 
      redirect: '/landing/auth/login' 
    }),
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function getGitHubTokens(code: string) {
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error_description || 'GitHub OAuth failed');
    }

    return data;
  } catch (error) {
    console.error('Error getting GitHub tokens:', error);
    throw error;
  }
}

export async function getGitHubUserInfo(accessToken: string) {
  try {
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Timetricx-App',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch GitHub user info');
    }

    const userData = await userResponse.json();

    // Get user emails (GitHub requires separate API call for emails)
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Timetricx-App',
      },
    });

    if (!emailsResponse.ok) {
      throw new Error('Failed to fetch GitHub user emails');
    }

    const emailsData = await emailsResponse.json();
    const primaryEmail = emailsData.find((email: any) => email.primary && email.verified);

    return {
      id: userData.id.toString(),
      email: primaryEmail?.email || userData.email,
      name: userData.name || userData.login,
      picture: userData.avatar_url,
      verified_email: !!primaryEmail?.verified,
      login: userData.login,
    };
  } catch (error) {
    console.error('Error getting GitHub user info:', error);
    throw error;
  }
}

export function getAppBaseUrl(request: NextRequest) {
  const requestUrl = new URL(request.url);
  return `${requestUrl.protocol}//${requestUrl.host}`;
}
