/* eslint-disable camelcase */
import { prisma } from '@/src/lib/prisma'
// import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username)
  const { year, month } = req.query
  // Intenção da Rota das horas da data: http://localhost:3000/api/users/lucasgb/availability?date=2023-12-26

  if (!year || !month) {
    return res.status(400).json({ message: 'Year or month not specified.' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' })
  }

  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  // Bloqueados: negação dos dias que constam no array de available, que nada mais é que um array de 7 posições igual a este que criamos aqui abaixo:
  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
    return !availableWeekDays.some(
      (availableWeekDay) => availableWeekDay.week_day === weekDay,
    )
  })

  const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
    SELECT
      EXTRACT(DAY FROM S.DATE) AS date,
      COUNT(S.date) AS amount,
      ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60) AS size 

    FROM schedulings S

    LEFT JOIN user_time_intervals UTI
      ON UTI.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 DAY))

    WHERE S.user_id = ${user.id}
      AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}

    GROUP BY EXTRACT(DAY FROM S.DATE),
      ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60)

    HAVING amount >= size
  `
  // Buscar os schedulings, mas somente os do usuário (com id correspondente)
  const blockedDates = blockedDatesRaw.map((item) => item.date)

  return res.json({ blockedWeekDays, blockedDates })
}
