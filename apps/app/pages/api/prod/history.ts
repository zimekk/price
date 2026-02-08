// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import api from "@acme/prod/api/history";

type Data = {
  result: unknown[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  // req.setTimeout(8000);
  return api(req.query).then((result) => res.status(200).json({ result }));
}
