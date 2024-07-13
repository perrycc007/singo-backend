import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    user: any;

    async findById(id: number) {
        return this.user.find(user => user.id === id);
      }

}
