import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Container, Header } from '../styles' // Reaproveitando do componente acima
import {
  FormError,
  IntervalBox,
  IntervalContainer,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
} from './styles'
import { getWeekDays } from '@/src/utils/get-week-days'
import { convertTimeStringToMinutes } from '@/src/utils/convert-time-string-to-minutes'
import { api } from '@/src/lib/axios'
import { useRouter } from 'next/router'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7) // mudando o formato do array para retornar só os dias marcados dentro dos dados (retornando pelo menos um dia com o refine):
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos um dia da semana!',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          // Novo objeto para cada um dos intervalos
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      })
    }) // Ajuste para ter diferença de horas e o início ser menos que o fim
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do início',
      },
    ),
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema> // Por causa das transformações, precisamos ter este type do input!!
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema> // Tipo final DEPOIS DAS TRANSFORMAÇÕES (Output, por isso trocamos o infer)

export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        // Tipo inicial ANTES DAS TRANSFORMAÇÕES (Input)
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const router = useRouter()

  const weekDays = getWeekDays() // Para esta parte funcionar, as props do método precisaram inicializar com = {}, para poder aplicar o estilo "short" no calendário principal, em schedule

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  const intervals = watch('intervals')

  async function handleSetTimeIntervals(data: unknown) {
    const { intervals } = data as TimeIntervalsFormOutput // Para corrigir bug das versões recentes
    // console.log(formData)

    await api.post('/users/time-intervals', { intervals })

    await router.push('/register/update-profile')
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Quase lá</Heading>
        <Text>
          Defina o intervalo de horários que você está disponível em cada dia da
          semana.
        </Text>

        <MultiStep size={4} currentStep={3} />
      </Header>

      <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
        <IntervalContainer>
          {fields.map((field, index) => {
            return (
              <IntervalItem key={field.id} /* id gerado automaticamente */>
                <IntervalDay>
                  <Controller
                    name={`intervals.${index}.enabled`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Checkbox
                          onCheckedChange={(checked) => {
                            field.onChange(checked === true)
                          }}
                          checked={field.value}
                        />
                      )
                    }}
                  />

                  <Text>{weekDays[field.weekDay]}</Text>
                </IntervalDay>
                <IntervalInputs>
                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    disabled={intervals[index].enabled === false}
                    {...register(`intervals.${index}.startTime`)}
                    crossOrigin={undefined}
                  />
                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    disabled={intervals[index].enabled === false}
                    {...register(`intervals.${index}.endTime`)}
                    crossOrigin={undefined}
                  />
                </IntervalInputs>
              </IntervalItem>
            )
          })}
        </IntervalContainer>

        {errors.intervals && (
          <FormError size="sm">{errors.intervals.root?.message}</FormError>
        )}

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  )
}
