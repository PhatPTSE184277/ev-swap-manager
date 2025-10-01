import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export const StringRequired = (name: string, min?: number, max?: number) => applyDecorators(
    ApiProperty({ required: true, minLength: min, maxLength: max }),
    IsString({ message: `${name} phải là chuỗi` }),
    IsNotEmpty({ message: `${name} không được để trống` }),
    ...(min !== undefined ? [MinLength(min, { message: `${name} phải có ít nhất ${min} ký tự` })] : []),
    ...(max !== undefined ? [MaxLength(max, { message: `${name} tối đa ${max} ký tự` })] : [])
);

export const StringNotRequired = (name: string) => applyDecorators(
    ApiProperty({ required: false }),
    IsString({ message: `${name} phải là chuỗi` }),
    IsOptional()
);

export const NumberRequired = (name: string, min?: number, max?: number) => applyDecorators(
    ApiProperty({ required: true }),
    Type(() => Number),
    IsNumber({}, { message: `${name} phải là số` }),
    IsNotEmpty({ message: `${name} không được để trống` }),
    ...(min !== undefined ? [Min(min, { message: `${name} phải lớn hơn hoặc bằng ${min}` })] : []),
    ...(max !== undefined ? [Max(max, { message: `${name} phải nhỏ hơn hoặc bằng ${max}` })] : [])
);

export const NumberNotRequired = (name: string) => applyDecorators(
    ApiProperty({ required: false }),
    Type(() => Number),
    IsNumber({}, { message: `${name} phải là số` }),
    IsOptional()
);

export const BooleanRequired = (name: string) => applyDecorators(
    ApiProperty({ required: true }),
    Type(() => Boolean),
    IsBoolean({ message: `${name} phải là boolean` }),
    IsNotEmpty({ message: `${name} không được để trống` })
);

export const BooleanNotRequired = (name: string) => applyDecorators(
    ApiProperty({ required: false }),
    Type(() => Boolean),
    IsBoolean({ message: `${name} phải là boolean` }),
    IsOptional()
);

export const EnumRequired = (name: string, enumType: object) => applyDecorators(
    ApiProperty({ required: true, enum: enumType }),
    IsEnum(enumType, { message: `${name} phải là: ${Object.values(enumType).join(", ")}` }),
    IsNotEmpty({ message: `${name} không được để trống` })
);

export const EnumNotRequired = (name: string, enumType: object) => applyDecorators(
    ApiProperty({ required: false, enum: enumType }),
    IsEnum(enumType, { message: `${name} phải là: ${Object.values(enumType).join(", ")}` }),
    IsOptional()
);

export const ArrayRequired = (name: string, type: any, minSize?: number, maxSize?: number) =>
    applyDecorators(
        ApiProperty({ required: true, type: 'array', isArray: true, items: { type: type.name } }),
        IsArray({ message: `${name} phải là mảng` }),
        ArrayNotEmpty({ message: `${name} không được để trống` }),
        Type(() => type),
        ...(minSize !== undefined ? [ArrayMinSize(minSize, { message: `${name} phải có ít nhất ${minSize} phần tử` })] : []),
        ...(maxSize !== undefined ? [ArrayMaxSize(maxSize, { message: `${name} chỉ được có tối đa ${maxSize} phần tử` })] : [])
    );

export const ArrayNotRequired = (name: string, type: any, minSize?: number, maxSize?: number) =>
    applyDecorators(
        ApiProperty({ required: false, type: 'array', isArray: true, items: { type: type.name } }),
        IsArray({ message: `${name} phải là mảng` }),
        Type(() => type),
        ...(minSize !== undefined ? [ArrayMinSize(minSize, { message: `${name} phải có ít nhất ${minSize} phần tử` })] : []),
        ...(maxSize !== undefined ? [ArrayMaxSize(maxSize, { message: `${name} chỉ được có tối đa ${maxSize} phần tử` })] : []),
        IsOptional()
    );