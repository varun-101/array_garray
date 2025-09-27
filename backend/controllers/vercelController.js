import fetch from "node-fetch";

const deployToVercelController = async (req, res) => {
  try {
    const { name, repoId } = req.body;
    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        gitSource: {
          type: "github",
          repoId: repoId,
          ref: "main", // or branch name
        },
      }),
    });

    const data = await response.json();
    return res.status(201).json({message: data.url})
  } catch (err) {
    return res.status(500).json({ message: "Failed to deploy" });
  }
};

export default deployToVercelController;
