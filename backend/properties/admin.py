from django.contrib import admin

from .models import Image, Location, Property


class ImageInline(admin.TabularInline):
    model = Image
    extra = 1
    fields = ('image', 'image_url', 'alt_text', 'is_primary')


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'country')
    search_fields = ('name', 'city', 'state', 'country')


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'price_per_night', 'is_active', 'updated_at')
    list_filter = ('is_active', 'location')
    list_select_related = ('location',)
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'slug', 'location__name')
    inlines = [ImageInline]


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'is_primary', 'image', 'image_url')
    list_filter = ('is_primary',)
    list_select_related = ('property',)
    search_fields = ('property__title', 'alt_text', 'image_url')
