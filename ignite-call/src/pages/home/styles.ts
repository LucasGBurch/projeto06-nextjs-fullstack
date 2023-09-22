import { styled, Heading, Text } from '@ignite-ui/react'

export const Container = styled('div', {
  // Cálculo para só a imagem perder espaço no container
  maxWidth: 'calc(100vw - (100vw - 1160px) / 2)',
  marginLeft: 'auto', // Alinha totalmente para a direita
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  gap: '$20',
})

export const Hero = styled('div', {
  maxWidth: 480,
  padding: '0 $10',

  // Estilizando o Heading sem precisar aplicar as="h1" no componente e dar problemas eventuais ao mudar os estilos
  [`> ${Heading}`]: {
    '@media(max-width: 600px)': {
      fontSize: '$6xl',
    },
  },
  // > é para aplicar só nos que estão dentro do componente Hero
  [`> ${Text}`]: {
    maskType: '$2',
    color: '$gray200',
  },
})

export const Preview = styled('div', {
  paddingRight: '$8',
  overflow: 'hidden',

  '@media(max-width: 600px)': {
    display: 'none',
  },
})
