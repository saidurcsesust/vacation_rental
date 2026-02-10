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
            terms = [part.strip() for part in location.split(',') if part.strip()]
            if not terms:
                terms = location.split()
            for term in terms:
                queryset = queryset.filter(
                    Q(location__name__icontains=term)
                    | Q(location__city__icontains=term)
                    | Q(location__country__icontains=term)
                )

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(location__name__icontains=query)
                | Q(location__city__icontains=query)
                | Q(location__country__icontains=query)
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
            queryset = queryset.filter(
                Q(name__icontains=term) | Q(city__icontains=term) | Q(country__icontains=term)
            )
        locations = queryset.order_by('name').distinct()[:10]
        payload = [
            {
                'name': location.name,
                'city': location.city,
                'country': location.country,
                'label': ', '.join([part for part in [location.name, location.city, location.country] if part]),
            }
            for location in locations
        ]
        return Response(payload)
