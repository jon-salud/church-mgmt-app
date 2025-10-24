import { Controller, Get, Put, Body, UseGuards, Param, Post, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { SettingsService } from "./settings.service";
import { CurrentUser } from "../auth/current-user.decorator";

@ApiTags("Settings")
@UseGuards(AuthGuard)
@Controller("settings")
export class SettingsController {
    constructor(private readonly service: SettingsService) {}

    @Get(":churchId")
    @ApiOperation({ summary: "Get church settings" })
    @ApiOkResponse({ description: "The church settings" })
    getSettings(@Param("churchId") churchId: string) {
        return this.service.getSettings(churchId);
    }

    @Put(":churchId")
    @ApiOperation({ summary: "Update church settings" })
    @ApiOkResponse({ description: "The updated church settings" })
    updateSettings(@Param("churchId") churchId: string, @Body() settings: any) {
        return this.service.updateSettings(churchId, settings);
    }

    @Get(":churchId/request-types")
    @ApiOperation({ summary: "Get all request types for a church" })
    @ApiOkResponse({ description: "A list of request types" })
    getRequestTypes(@Param("churchId") churchId: string) {
        return this.service.getRequestTypes(churchId);
    }

    @Post(":churchId/request-types")
    @ApiOperation({ summary: "Create a new request type" })
    @ApiOkResponse({ description: "The newly created request type" })
    createRequestType(@Param("churchId") churchId: string, @Body() body: { name: string; hasConfidentialField?: boolean; description?: string }, @CurrentUser() user: any) {
        return this.service.createRequestType(body.name, body.hasConfidentialField ?? false, user.id, body.description);
    }

    @Put(":churchId/request-types/:id")
    @ApiOperation({ summary: "Update a request type" })
    @ApiOkResponse({ description: "The updated request type" })
    updateRequestType(@Param("id") id: string, @Body() body: { name: string }, @CurrentUser() user: any) {
        return this.service.updateRequestType(id, body.name, user.id);
    }

    @Delete(":churchId/request-types/:id")
    @ApiOperation({ summary: "Archive a request type" })
    @ApiOkResponse({ description: "The archived request type" })
    archiveRequestType(@Param("id") id: string, @CurrentUser() user: any) {
        return this.service.archiveRequestType(id, user.id);
    }

    @Put(":churchId/request-types/:id/status")
    @ApiOperation({ summary: "Update the status of a request type" })
    @ApiOkResponse({ description: "The updated request type" })
    updateRequestTypeStatus(@Param("id") id: string, @Body() body: { status: "active" | "archived" }, @CurrentUser() user: any) {
        return this.service.updateRequestTypeStatus(id, body.status, user.id);
    }

    @Post(":churchId/request-types/reorder")
    @ApiOperation({ summary: "Update the order of request types" })
    @ApiOkResponse({ description: "The updated request types" })
    reorderRequestTypes(@Body() body: { ids: string[] }, @CurrentUser() user: any) {
        return this.service.reorderRequestTypes(body.ids, user.id);
    }
}
