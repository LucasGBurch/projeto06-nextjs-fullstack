import { Avatar, Heading, Text } from '@ignite-ui/react'
import { Container, UserHeader } from './styles'
import { GetStaticPaths, GetStaticProps } from 'next'
import { prisma } from '@/src/lib/prisma'

interface ScheduleProps {
  user: {
    name: string
    bio: string
    // avatarUrl: string // Não vou chegar a usar o avatarUrl aqui por estar com aquele bug do google
  }
}

export default function Schedule({ user }: ScheduleProps) {
  return (
    <Container>
      <UserHeader>
        <Avatar src="https://github.com/LucasGBurch.png" />
        <Heading>{user.name}</Heading>
        <Text>{user.bio}</Text>
      </UserHeader>
    </Container>
  )
}

// Página estática com parâmetro dinâmico, como nosso username, precisa deste Paths também
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // Gera o param conforme pessoas vão acessando
    fallback: 'blocking',
  }
}

// Criação de página ESTÁTICA DO NEXT, para garantir conteúdo renderizado na página/rota:
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const username = String(params?.username)

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return {
      notFound: true, // erro 404
    }
  }

  return {
    props: {
      user: {
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
      },
    },
    revalidate: 60 * 60 * 24, // 1 day
  }
}
