import { RequestStatus, ReservationStatus, Role, SpaceType } from "@/generated/prisma";

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor?: string | null;
  manages: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  ownerships?: Array<{
    id: string;
    name: string;
    locationId: string;
  }>;
};

export type LocationStats = {
  totalSpaces: number;
  available: number;
  reserved: number;
  occupied: number;
};

export type LocationSummary = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  address?: string | null;
  description?: string | null;
  stats: LocationStats;
  spaceTypes: Partial<Record<SpaceType, number>>;
  admins: Array<{
    id: string;
    name: string;
    email: string;
  }>;
};

export type SpaceSummary = {
  id: string;
  name: string;
  code?: string | null;
  type: SpaceType;
  description?: string | null;
  capacity: number;
  location: {
    id: string;
    name: string;
    timezone: string;
  };
  floor?: number | null;
  gridX?: number | null;
  gridY?: number | null;
  color?: string | null;
  hasFixedOwner: boolean;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatarColor?: string | null;
  } | null;
  openingWindows?: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  reservations: Array<{
    id: string;
    start: string;
    end: string;
    status: ReservationStatus;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  status: "available" | "reserved" | "occupied";
  nextAvailability: string | null;
};

export type ReservationSummary = {
  id: string;
  spaceId: string;
  userId: string;
  start: string;
  end: string;
  status: ReservationStatus;
  user: {
    id: string;
    name: string;
    email: string;
  };
  space: {
    id: string;
    name: string;
    type: SpaceType;
    location: {
      id: string;
      name: string;
    };
  };
  notes?: string | null;
};

export type OccupancyRequestSummary = {
  id: string;
  spaceId: string;
  requesterId: string;
  start: string;
  end: string;
  status: RequestStatus;
  decisionNote?: string | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  handledBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  space: {
    id: string;
    name: string;
    type: SpaceType;
    owner?: {
      id: string;
      name: string;
      email: string;
    } | null;
    location: {
      id: string;
      name: string;
    };
  };
};
