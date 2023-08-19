import { z } from "zod";

export const ItemSchema = z.object({
  dlug_geo: z.string(),
  id_ulicy: z.string(),
  kierunek: z.string(),
  nazwa_zespolu: z.string(),
  obowiazuje_od: z.string(),
  slupek: z.string(),
  szer_geo: z.string(),
  zespol: z.string(),
});
