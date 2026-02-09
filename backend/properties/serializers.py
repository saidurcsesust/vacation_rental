from rest_framework import serializers

from .models import Image, Location, Property


class ImageSerializer(serializers.ModelSerializer):
    final_url = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ['id', 'final_url', 'image_url', 'alt_text', 'is_primary']

    def get_final_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'city', 'state', 'country']


class PropertyListSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id',
            'title',
            'slug',
            'location_name',
            'price_per_night',
            'bedrooms',
            'bathrooms',
            'max_guests',
            'primary_image',
        ]

    def get_primary_image(self, obj):
        request = self.context.get('request')
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if not image:
            return ''
        if image.image:
            if request is not None:
                return request.build_absolute_uri(image.image.url)
            return image.image.url
        return image.image_url


class PropertyDetailSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    images = ImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'location',
            'price_per_night',
            'bedrooms',
            'bathrooms',
            'max_guests',
            'images',
        ]
