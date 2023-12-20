interface GetWeekDaysParams {
  short?: boolean
}

export function getWeekDays({ short = false }: GetWeekDaysParams = {}) {
  // = {} para fazer o short opcional e não bugar no calendário
  const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }) // long == escrito por extenso

  // keys() retorna os índices de cada undefined desse array. Essa função vai funcionar através de índice [] em vez de parâmetros na chamada: 0, 1, 2, 3, 4, 5, 6
  return Array.from(Array(7).keys())
    .map((day) => formatter.format(new Date(Date.UTC(2021, 5, day))))
    .map((weekDay) => {
      if (short) {
        return weekDay.substring(0, 3).toUpperCase()
      }

      return weekDay.substring(0, 1).toUpperCase().concat(weekDay.substring(1))
    }) // Último map para os dias da semana retornados começarem com letra maiúscula.
}

// ATENÇÃO! new Date(Date.UTC(2021, 5, day))) É UMA SEMANA ONDE 0 = DOMINGO, 1 = SEGUNDA ETC
