from django.urls import path

from .views import LocationAutocompleteAPIView, PropertyDetailAPIView, PropertyListAPIView

urlpatterns = [
    path('properties/', PropertyListAPIView.as_view(), name='property-list'),
    path('properties/<slug:slug>/', PropertyDetailAPIView.as_view(), name='property-detail'),
    path('locations/autocomplete/', LocationAutocompleteAPIView.as_view(), name='location-autocomplete'),
]
