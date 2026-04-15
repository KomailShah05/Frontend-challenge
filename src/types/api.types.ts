// ─── Raw API shapes (readonly — server data is never mutated client-side) ─────

export interface CatImage {
  readonly id: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly sub_id?: string;
  readonly created_at?: string;
}

export interface UploadResponse {
  readonly id: string;
  readonly url: string;
  readonly sub_id?: string;
  readonly width: number;
  readonly height: number;
  readonly original_filename: string;
  readonly pending: number;
  readonly approved: number;
}

export interface Vote {
  readonly id: number;
  readonly image_id: string;
  /** 1 = up vote, 0 = down vote */
  readonly value: 1 | 0;
  readonly sub_id?: string;
  readonly created_at: string;
}

export interface VotePayload {
  readonly image_id: string;
  readonly value: 1 | 0;
  readonly sub_id: string;
}

export interface Favourite {
  readonly id: number;
  readonly image_id: string;
  readonly sub_id?: string;
  readonly created_at: string;
}

export interface FavouritePayload {
  readonly image_id: string;
  readonly sub_id: string;
}

// ─── Derived / UI types ───────────────────────────────────────────────────────

/** Merged shape used by CatCard — combines image + vote score + favourite state */
export interface CatCardData {
  readonly image: CatImage;
  readonly score: number;
  readonly favouriteId: number | null;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadFile {
  readonly uri: string;
  readonly name: string;
  readonly type: string;
}

// ─── API utility ─────────────────────────────────────────────────────────────

export interface ApiMessageResponse {
  readonly message: string;
}

export interface ApiCreatedResponse extends ApiMessageResponse {
  readonly id: number;
}
