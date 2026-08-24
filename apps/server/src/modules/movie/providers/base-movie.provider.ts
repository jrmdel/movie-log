import { HttpService } from '@nestjs/axios';
import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export abstract class BaseMovieProvider {
  constructor(protected readonly httpService: HttpService) {}

  protected async request<T>(url: string, params: object | undefined, action: string): Promise<T> {
    try {
      const request$ = this.httpService.get<T>(url, { params });
      const response = await firstValueFrom(request$);

      return response.data;
    } catch (error) {
      throw this.toHttpException(error, action);
    }
  }

  private toHttpException(error: unknown, action: string): BadGatewayException | ServiceUnavailableException {
    // Distinguish "the provider responded with an error" from "the provider could not be reached at all".
    if (error instanceof AxiosError && error.response) {
      return new BadGatewayException(`Failed to ${action}: the movie provider returned an error`);
    }
    return new ServiceUnavailableException(`Failed to ${action}: the movie provider is unavailable`);
  }
}
