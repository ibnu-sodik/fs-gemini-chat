export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const body = await readBody(event);
    const { code, state } = body;

    if (!code) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing authorization code",
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = (await $fetch(
      `${config.public.logtoEndpoint}/oidc/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: config.public.logtoAppId as string,
          client_secret: config.logtoAppSecret as string,
          code,
          redirect_uri: `${getRequestURL(event).origin}/auth/callback`,
        }).toString(),
      }
    )) as {
      access_token: string;
      id_token: string;
      token_type: string;
      expires_in: number;
    };

    if (!tokenResponse.access_token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to obtain access token",
      });
    }

    // Get user info using access token
    const userInfo = (await $fetch(`${config.public.logtoEndpoint}/oidc/me`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
    })) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    // Set secure session cookie
    const sessionData = {
      userId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      accessToken: tokenResponse.access_token,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    };

    // Encrypt session data (simple base64 for now, use proper encryption in production)
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString(
      "base64"
    );

    // Set HTTP-only cookie
    setCookie(event, "logto-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenResponse.expires_in,
    });

    return {
      success: true,
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
    };
  } catch (error) {
    console.error("Callback error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
});
