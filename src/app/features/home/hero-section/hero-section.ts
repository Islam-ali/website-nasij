import { IArchived } from "../../../interfaces/archive.interface";
import { MultilingualText } from "../../../core/models/multi-language";

export interface HeroSection {
    _id: string;
    title: MultilingualText;
    subTitle: MultilingualText;
    image: IArchived;
    buttonName: MultilingualText;
    buttonLink: string;
    isAlways: boolean;
    isActive: boolean;
    order: number;
}
