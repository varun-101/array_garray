import axios from "axios";
import dotenv from "dotenv";
import DatabaseService from "../services/databaseService.js";

dotenv.config();

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

export const github = (req, res) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user,repo`;
    res.redirect(redirectUrl);
};

export const githubCallback = async (req, res) => {
    const { code } = req.query;

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;
    console.log(accessToken);
    
    // Fetch user profile
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userRes.data;

    // Save or update user in database
    const user = await DatabaseService.createOrUpdateUser(githubUser, accessToken);

    // Redirect back to client with token and user info in URL hash
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const safeUser = {
      id: user._id,
      githubId: user.githubId,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      githubUrl: user.githubUrl,
      lastLoginAt: user.lastLoginAt,
    };

    const encodedUser = encodeURIComponent(Buffer.from(JSON.stringify(safeUser)).toString("base64"));
    const redirectTo = `${clientUrl}/#accessToken=${encodeURIComponent(accessToken)}&user=${encodedUser}`;
    return res.redirect(redirectTo);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GitHub login failed" });
  }
};