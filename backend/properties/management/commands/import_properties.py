import csv
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from properties.models import Image, Location, Property


class Command(BaseCommand):
    help = 'Import vacation rental properties from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_path', type=str, help='Path to CSV file')
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete existing properties/images before import',
        )

    @staticmethod
    def _value(row, *keys, default=''):
        for key in keys:
            if key in row and row[key] is not None:
                value = str(row[key]).strip()
                if value:
                    return value
        return default

    @staticmethod
    def _to_int(value, default=0):
        try:
            return int(float(value))
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _to_optional_int(value):
        text = str(value).strip()
        if not text:
            return None
        try:
            return int(float(text))
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _to_decimal_str(value, default='0.00'):
        text = str(value).strip()
        if not text:
            return default
        try:
            return f'{float(text):.2f}'
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _build_slug(title, source_slug=''):
        if source_slug:
            return slugify(source_slug)
        return slugify(title)[:250] or 'property'

    def _extract_image_urls(self, row):
        urls = []

        direct = self._value(row, 'image_urls', 'images', 'image_links')
        if direct:
            for raw in direct.replace(';', ',').split(','):
                url = raw.strip()
                if url:
                    urls.append(url)

        for index in range(1, 8):
            url = self._value(
                row,
                f'image_{index}',
                f'image{index}',
                f'image_url_{index}',
                f'image_url{index}',
            )
            if url:
                urls.append(url)

        return list(dict.fromkeys(urls))

    @transaction.atomic
    def handle(self, *args, **options):
        csv_path = Path(options['csv_path']).expanduser().resolve()
        if not csv_path.exists():
            raise CommandError(f'CSV file not found: {csv_path}')

        if options['clear']:
            Image.objects.all().delete()
            Property.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared existing properties and images.'))

        created_locations = 0
        created_properties = 0
        created_images = 0

        with csv_path.open('r', encoding='utf-8-sig', newline='') as csv_file:
            reader = csv.DictReader(csv_file)
            if not reader.fieldnames:
                raise CommandError('CSV is missing a header row.')

            for row in reader:
                title = self._value(row, 'title', 'property_title', 'name')
                if not title:
                    continue

                location_name = self._value(row, 'location_name', 'location', 'city', default='Unknown')
                city = self._value(row, 'city')
                state = self._value(row, 'state', 'province')
                country = self._value(row, 'country', default='')

                location, location_created = Location.objects.get_or_create(
                    name=location_name,
                    defaults={'city': city, 'state': state, 'country': country},
                )
                if location_created:
                    created_locations += 1
                else:
                    changed = False
                    if city and location.city != city:
                        location.city = city
                        changed = True
                    if state and location.state != state:
                        location.state = state
                        changed = True
                    if country and location.country != country:
                        location.country = country
                        changed = True
                    if changed:
                        location.save(update_fields=['city', 'state', 'country'])

                slug = self._build_slug(title, self._value(row, 'slug', 'property_slug'))

                property_payload = {
                    'location': location,
                    'title': title,
                    'description': self._value(row, 'description', 'details', default=''),
                    'price_per_night': self._to_decimal_str(
                        self._value(row, 'price_per_night', 'price', default='0')
                    ),
                    'bedrooms': self._to_int(self._value(row, 'bedrooms', default='1'), default=1),
                    'bathrooms': self._to_int(self._value(row, 'bathrooms', default='1'), default=1),
                    'max_guests': self._to_int(self._value(row, 'max_guests', 'guests', default='1'), default=1),
                    'is_active': self._value(row, 'is_active', default='true').lower()
                    not in {'false', '0', 'no'},
                }

                source_id = self._to_optional_int(self._value(row, 'id'))
                if source_id is not None:
                    property_obj, property_created = Property.objects.update_or_create(
                        id=source_id,
                        defaults={**property_payload, 'slug': slug},
                    )
                else:
                    property_obj, property_created = Property.objects.update_or_create(
                        slug=slug,
                        defaults=property_payload,
                    )

                if property_created:
                    created_properties += 1

                image_urls = self._extract_image_urls(row)
                if image_urls:
                    property_obj.images.filter(image_url__isnull=False).delete()

                for index, image_url in enumerate(image_urls):
                    Image.objects.create(
                        property=property_obj,
                        image_url=image_url,
                        is_primary=index == 0,
                        alt_text=f'{property_obj.title} image {index + 1}',
                    )
                    created_images += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Import completed: {created_locations} new locations, '
                f'{created_properties} new properties, {created_images} images.'
            )
        )
