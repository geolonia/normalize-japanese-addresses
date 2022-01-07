import { currentConfig } from '../../config'
import unfetch from 'isomorphic-unfetch'
import { DataFetcher } from '../../normalize'

export const fetchData: DataFetcher = (url: string) => {
  return unfetch(`${currentConfig.japaneseAddressesApi}${encodeURI(url)}`)
}
