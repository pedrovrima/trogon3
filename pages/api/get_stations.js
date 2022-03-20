// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "lib/prisma";

export default async function (req, res) {
  const variables = await prisma.STATION_REGISTER.findMany({
    select: {
      station_id: true,
      station_code: true,
      station_name: true,
    
    },
    include:{
        net_register:true
    }
  });
  res.send(variables);
}
