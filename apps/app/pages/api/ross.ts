// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result: unknown[];
};

const API_URL = process.env.PRICE_API_URL || "/";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return fetch(`${API_URL}/rossm`)
    .then((res) => res.json())
    .then((data) => res.status(200).json(data));
}
