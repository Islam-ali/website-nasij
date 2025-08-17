import { IArchived } from "../../../interfaces/archive.interface";

export interface HeroSection {
    _id: string;
    title: string;
    subTitle: string;
    image: IArchived;
    buttonName: string;
    buttonLink: string;
    isAlways: boolean;
    isActive: boolean;
    order: number;
}
