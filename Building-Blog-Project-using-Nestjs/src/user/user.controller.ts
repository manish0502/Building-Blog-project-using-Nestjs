import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Put,
  Delete,
  Param,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole } from './models/user-interface';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CreateUserDto } from './models/dtos/user.dto';
import { hasRoles } from '../auth/decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  //----this is using interface User----------
  // @Post()
  // create(@Body() user: CreateUserDto): Observable<CreateUserDto | Object> {
  //     return this.userService.create(user).pipe(
  //         map((user: CreateUserDto) => user),
  //         catchError(err => of({ error: err.message }))
  //     );
  // }

  @Post()
  create(@Body() user: User): Observable<CreateUserDto | Object> {
    return this.userService.create(user).pipe(
      map((user: CreateUserDto) => user),
      catchError((err) => of({ error: err.message })),
    );
  }

  @Post('login')
  login(@Body() body: CreateUserDto): Observable<Object> {
    return this.userService.login(body).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }

  // ------This is Using DTO files------------------
  // @Post()
  // create(@Body() user: CreateUserDto): Observable<CreateUserDto | Object> {
  //     return this.userService.create(user).pipe(
  //         map((user: CreateUserDto) => user),
  //         catchError(err => of({ error: err.message }))
  //     );
  // }

  @Get('/:id')
  findOne(@Param('id') id: string): Observable<CreateUserDto | Object> {
    return this.userService.findOne(Number(id));
  }

  //endPoint -> http://localhost:3000/users?email=ranjeet423@gmail.com

  //-----old findAll method without pagination-----
  //  @hasRoles(UserRole.ADMIN)
  //  @UseGuards(JwtAuthGuard, RolesGuard)
  //   @Get()
  //   findAll():Observable<CreateUserDto[]>{
  //       return this.userService.findAll()
  //   }

  //-----------index as findAll with pagination-----------

  // http://localhost:3000/users
  //http://localhost:3000/users?page=2&limit=2
  

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  index(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('username') username: string,
  ): Observable<Pagination<CreateUserDto>> {
    limit = limit > 100 ? 100 : limit;
    console.log(username)
    if (username === null || username === undefined) {
      return this.userService.paginate({page:Number(page) , limit:Number(limit) ,route:'http://localhost:3000/users'});

    }
    else {
      return this.userService.paginateFilterByUsername(
        { page: Number(page), limit: Number(limit), route: 'http://localhost:3000/users' },
        { username })
    }
  }

  @Put('/:id')
  updateOne(
    @Param('id') id: string,
    @Body() user: CreateUserDto,
  ): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }

  //http://localhost:3000/users/21/role  , you can oly update if you have token generated as the admin

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateRoleOfUser(
    @Param('id') id: string,
    @Body() user: CreateUserDto,
  ): Observable<User> {
    return this.userService.updateRoleOfUser(Number(id), user);
  }

  @hasRoles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  deleteOne(@Param('id') id: string): Observable<CreateUserDto | Object> {
    return this.userService.deleteOne(Number(id));
  }

  // @Get()
  // findUserByMail(@Query('email') email: string){
  //      return this.userService.findUserByMail(email)
  // }
}
