// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import api from "@acme/prop/api";

type Data = {
  result: unknown[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return api(req.query).then((result) => res.status(200).json({ result }));
}
