declare class Error {
  public message: string
  public address: string
  constructor(message?: string)
}

class NormalizationError extends Error {
  constructor(message: string, address: string) {
    super(message)

    this.address = address
  }
}

export default NormalizationError
