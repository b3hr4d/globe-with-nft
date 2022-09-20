export enum TileType {
  Grass,
  Snow,
  Water,
  Sand,
}

export enum TileAttributes {
  Base,
  Effect,
  UnBuildable,
  Tree,
  Charcoal,
  Iron,
  Gold,
  Crystal,
  Diamond,
}

export type Type = keyof typeof TileType
export type Attr = keyof typeof TileAttributes

type AllData = Type | Attr

export interface MetaData {
  name: string
  external_url: string
  description: string
  image: string
  data: string
  tileMap: Uint8Array
  attributes: StandardType[]
}

export type StandardType = {
  display_type?: string
  trait_type?: string
  value: Attr | Type | number
}

export type Attributes = {
  [key in AllData]: number
}

export type Tile = Attributes
