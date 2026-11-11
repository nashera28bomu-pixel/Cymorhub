import type { Movie } from './framex'

const base = (m: Partial<Movie> & Pick<Movie, 'id' | 'title'>): Movie => ({ genres: [], cast: [], sources: [], ...m })
const t = (p: string) => `https://image.tmdb.org/t/p/w500${p}`

/** Shown only while FrameX is not connected (no API key / offline). */
export const samples: Movie[] = [
  base({ id: 'dune-part-two', title: 'Dune: Part Two', year: '2024', genres: ['Sci-Fi', 'Adventure', 'Action'], poster: t('/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'), overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', rating: '8.8', runtime: '2h 46m' }),
  base({ id: 'gladiator-ii', title: 'Gladiator II', year: '2024', genres: ['Action', 'Drama'], poster: t('/2cxhvwyEwRlysAmRH4IODkvo0z5.jpg'), overview: 'A new generation rises in the arena as the empire faces its most uncertain hour.', rating: '7.4', runtime: '2h 28m' }),
  base({ id: 'the-wild-robot', title: 'The Wild Robot', year: '2024', genres: ['Animation', 'Adventure', 'Sci-Fi'], poster: t('/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg'), overview: 'A robot finds a new purpose after being shipwrecked on a remote island.', rating: '8.3', runtime: '1h 42m' }),
  base({ id: 'inside-out-2', title: 'Inside Out 2', year: '2024', genres: ['Animation', 'Comedy', 'Drama'], poster: t('/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg'), overview: 'Riley enters her teenage years, and headquarters welcomes a group of new emotions.', rating: '7.8', runtime: '1h 36m' }),
  base({ id: 'bad-boys-ride-or-die', title: 'Bad Boys: Ride or Die', year: '2024', genres: ['Action', 'Comedy'], poster: t('/oGythE98MYleE6mZlGs5oBGkux1.jpg'), overview: 'Miami detectives Mike and Marcus are back for one last ride.', rating: '7.0', runtime: '1h 55m' }),
  base({ id: 'descendants-wicked-wonderland', title: 'Descendants: Wicked Wonderland', year: '2024', genres: ['Adventure', 'Comedy'], overview: 'A new adventure awaits in a world where every story has another side.', rating: '7.2', runtime: '1h 40m' }),
]
