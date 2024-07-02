import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value) {
    if (
      (value && value['mimetype']) ||
      (value.length > 0 && value[0]['mimetype'])
    ) {
      return value;
    } else {
      const { error } = this.schema.validate(value);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }
      return value;
    }
  }
}
