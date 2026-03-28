export default function handler(
  req: any,
  res: any
) {
  res.status(200).json({ 
    status: "ok", 
    openai: !!process.env.OPENAI_API_KEY,
    env: process.env.NODE_ENV 
  });
}
