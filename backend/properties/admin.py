from django.contrib import admin
from django.utils.html import format_html

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
    list_display = ('title', 'location', 'price_per_night', 'is_active', 'updated_at', 'upload_image')
    list_filter = ('is_active', 'location')
    list_select_related = ('location',)
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'slug', 'location__name')
    inlines = [ImageInline]

    def upload_image(self, obj):
        return format_html(
            '<a href="/admin/properties/image/add/?property={}">Upload image</a>',
            obj.pk,
        )

    upload_image.short_description = 'Image Upload'


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'is_primary', 'image', 'image_url')
    list_filter = ('is_primary',)
    list_select_related = ('property',)
    search_fields = ('property__title', 'alt_text', 'image_url')

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        property_id = request.GET.get('property')
        if property_id:
            initial['property'] = property_id
        return initial

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        property_id = request.GET.get('property')
        if obj is None and property_id and 'property' in form.base_fields:
            form.base_fields['property'].disabled = True
        return form

    def save_model(self, request, obj, form, change):
        property_id = request.GET.get('property')
        if not change and property_id:
            obj.property_id = property_id
        super().save_model(request, obj, form, change)
