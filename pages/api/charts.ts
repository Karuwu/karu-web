import { readdirSync } from 'fs';
import { join } from 'path';
import { NextApiResponse } from 'next';

export default function handler(_: any, res: NextApiResponse) {
  const chartsDir = join(process.cwd(), 'public/charts');
  const files = readdirSync(chartsDir).filter((file) => file.endsWith('.json'));
  res.status(200).json(files);
}