/* eslint-disable camelcase */
import { prisma } from '@/src/lib/prisma'
import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username)
  const { date } = req.query
  // Intenção da Rota das horas da data: http://localhost:3000/api/users/lucasgb/availability?date=2023-12-26

  if (!date) {
    return res.status(400).json({ message: 'Date not provided.' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' })
  }

  const referenceDate = dayjs(String(date))
  const isPastDate = referenceDate.endOf('day').isBefore(new Date())

  if (isPastDate) {
    // Se é data que já passou
    return res.json({ availability: [] })
  }

  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'), // A data de referência, que bate com o dia da semana (seg, ter...) no banco de dados do UseTimeInterval
    },
  })

  if (!userAvailability) {
    // Se não retornou horário
    return res.json({ availability: [] })
  }

  const { time_start_in_minutes, time_end_in_minutes } = userAvailability

  // De hora em hora, por isso podemos dividir por 60
  const startHour = time_start_in_minutes / 60
  const endHour = time_end_in_minutes / 60

  // Agora, criação de um Array com as horas possivelmente disponíveis (verificamos se bate no banco depois):
  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    (_, i) => {
      return startHour + i // Vai adicionando mais um para incrementar a hora de começo
    },
  )

  return res.json({ possibleTimes })
}
