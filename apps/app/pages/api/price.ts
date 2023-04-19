// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return fetch(process.env.PRICE_API_URL || '/')
  .then(res => res.json())
  .then(data =>
    res.status(200).json(data)
    )
}
