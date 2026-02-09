from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Location, Property
from .pagination import PropertyPagination
from .serializers import PropertyDetailSerializer, PropertyListSerializer


class PropertyListAPIView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [AllowAny]
    pagination_class = PropertyPagination

    def get_queryset(self):
        queryset = (
            Property.objects.filter(is_active=True)
            .select_related('location')
            .prefetch_related('images')
        )

        location = self.request.query_params.get('location', '').strip()
        query = self.request.query_params.get('q', '').strip()

        if location:
            queryset = queryset.filter(location__name__icontains=location)

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(location__name__icontains=query)
            )

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if min_price:
            queryset = queryset.filter(price_per_night__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_night__lte=max_price)

        return queryset


class PropertyDetailAPIView(generics.RetrieveAPIView):
    serializer_class = PropertyDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return (
            Property.objects.filter(is_active=True)
            .select_related('location')
            .prefetch_related('images')
        )


class LocationAutocompleteAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        term = request.query_params.get('q', '').strip()
        queryset = Location.objects.all()
        if term:
            queryset = queryset.filter(name__icontains=term)
        names = list(queryset.order_by('name').values_list('name', flat=True).distinct()[:10])
        return Response(names)
