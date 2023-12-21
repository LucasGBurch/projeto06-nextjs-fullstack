import { CaretLeft, CaretRight } from 'phosphor-react'
import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle,
} from './styles'
import { getWeekDays } from '@/src/utils/get-week-days'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

interface CalendarWeek {
  week: number
  days: Array<{
    date: dayjs.Dayjs
    disabled: boolean
  }>
}

type CalendarWeeks = CalendarWeek[]

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => {
    return dayjs().set('date', 1) // , 1 para mês e ano, sem o dia
  })

  function handlePreviousMonth() {
    const previousMonthDate = currentDate.subtract(1, 'month') // Subtrai 1 mês da data do estado

    setCurrentDate(previousMonthDate)
  }

  function handleNextMonth() {
    const nextMonthDate = currentDate.add(1, 'month') // Adiciona 1 mês da data do estado

    setCurrentDate(nextMonthDate)
  }

  const shortWeekDays = getWeekDays({ short: true })

  const currentMonth = currentDate.format('MMMM') // mês por extenso
  const currentYear = currentDate.format('YYYY')

  // [ [1, 2, 3] [4, 5, 6, 7, 8, 9, 10]] Array de semanas com dias:
  const calendarWeeks = useMemo(() => {
    // Memoizando o retorno para calcular os dias somente quando for realmente necessário, em vez de sempre que o componente renderizar
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, i) => {
      // Valor _ não importa, aqui precisamos do índice i, que começa em 0, por isso o + 1. Usamos 'date' para pegar os dias em vez do 'day', que pega o dia DA SEMANA, por mais estranho que pareça:
      return currentDate.set('date', i + 1)
    })

    // Número de dias que faltaram para preencher a linha da semana:
    const firstWeekDay = currentDate.get('day')

    // Array para os dias do mês anterior, para completar a linha:
    const previousMonthFillArray = Array.from({
      length: firstWeekDay,
    })
      .map((_, i) => {
        return currentDate.subtract(i + 1, 'day')
      })
      .reverse()

    // Settando dia da data no total de dias do mês
    const lastDayInCurrentMonth = currentDate.set(
      'date',
      currentDate.daysInMonth(),
    )
    const lastWeekDay = lastDayInCurrentMonth.get('day')

    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1), // Começa do 0, o +1 deixa mais claro
    }).map((_, i) => {
      return lastDayInCurrentMonth.add(i + 1, 'day')
    })

    // Array completo desabilitando os outros meses com map:
    const calendarDays = [
      ...previousMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
      ...daysInMonthArray.map((date) => {
        return { date, disabled: false }
      }),
      ...nextMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
    ]

    // Agora divisão do array em semanas (_ é cada date, não usaremos, weeks é que iremos manipular aqui para criar as linhas de semanas; original é o calendarDays, mas que podemos modificar sem alterar a variável original)
    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, i, original) => {
        const isNewWeek = i % 7 === 0 // Até fechar 7 dias não acaba a semana

        if (isNewWeek) {
          weeks.push({
            week: i / 7 + 1, // Semana começa em 1 em vez de 0
            days: original.slice(i, i + 7),
          })
        }

        return weeks
      },
      [],
    )

    return calendarWeeks
  }, [currentDate])

  console.log(calendarWeeks)

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span>{currentYear}</span>
        </CalendarTitle>

        <CalendarActions>
          <button onClick={handlePreviousMonth} title="Previous month">
            <CaretLeft />
          </button>
          <button onClick={handleNextMonth} title="Next month">
            <CaretRight />
          </button>
        </CalendarActions>
      </CalendarHeader>

      <CalendarBody>
        <thead>
          <tr>
            {shortWeekDays.map((weekDay) => (
              <th key={weekDay}>{weekDay}.</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks.map(({ week, days }) => {
            return (
              <tr key={week}>
                {days.map(({ date, disabled }) => {
                  return (
                    <td key={date.toString()}>
                      <CalendarDay disabled={disabled}>
                        {date.get('date')}
                      </CalendarDay>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  )
}
