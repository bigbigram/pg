import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Handle the form submission logic here
    // This replaces the g2c.jsp processing
    const formData = req.body;
    
    // Add your business logic here
    
    res.status(200).json({ success: true, data: formData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
