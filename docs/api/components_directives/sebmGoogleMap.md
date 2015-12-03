---
title: SebmGoogleMap
description: SebMGoogleMap renders a Google Map.
type: apidetails
---

## CSS Selector

```css
sebm-google-map
```

## Usage

```typescript
import {SebmGoogleMap} from 'angular2_google_maps/angular2_google_maps'};
```

```html
<sebm-google-map [latitude]="lat" [longitude]="lng" [zoom]="zoom">
</sebm-google-map>
```

## Bindings

| HTML Attribute Name | Type   | Required | Default | Description                             |
|---------------------|--------|----------|---------|-----------------------------------------|
| latitude            | number | yes      | 0       | The latitude for the center of the map  |
| longitude           | number | yes      | 0       | The longitude for the center of the map |
| zoom                | number | no       | 8       | The initial zoom level of the map       |

## Events

None