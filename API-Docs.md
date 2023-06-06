# Hangry Backend Test API Documentation

## Endpoints:

List of available endpoints:

- `POST /users/register`
- `POST /users/login`
- `PUT /users/profile`
- `POST /users/add-balance`
- `GET /menus?maxPrice={value}&sort=-{value}&page[size]={value}&page[number]={value}`
- `POST /menus`
- `GET /menus/:id`
- `DELETE /menus/:id`
- `PUT /menus/:id`
- `GET /carts`
- `POST /carts/:id`
- `PUT /carts/:id`
- `DELETE /carts/:id`
- `GET /orders`
- `POST /orders/:id`


## POST /users/register

### Description

- Create new user with role Customer to system

### Request

Body

```json
{
    "username": "string",
    "email" : "string",
    "password" : "string",
    "phoneNumber" : "string",
}
```

### Responses:

_201 - Created_

```json
{
    "id": 5,
    "email": "andikaperkasa@gmail.com",
    "message": "User with email andikaperkasa@gmail.com and username andikaperkasa is succesfully registered"
}
```

_400 - Bad Request_

```json
{
    "message": "Username is required!" 
}
OR
{
    "message": "Username is already used, please use another username!"
}
OR
{
    "message": "Email is required!"
}
OR
{
    "message": "Email format is not valid!"
}
OR
{
    "message": "Email is already used, please use another email!"
}
OR
{
    "message": "Password is required!"
}
OR
{
    "message": "Password length are minimum 8 characters!"
}
OR
{
    "message": "Phone number is required!"
}
```


## POST /users/login

### Description

- Log in using user's email and password

### Request

- Body

```json
{
    "email" : "string",
    "password" : "string"
}
```

### Responses:

_200 - OK_

```json
{
    "access_token": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "message": "<username> is successfully logged in"
}
```

_(400 - Bad Request)_

```json
{
    "message": "Email is Required!"
}
OR
{
    "message": "Password is Required!"
}
```


## PUT /users/profile

### Description

- Edit user profile or complete new user profile

### Request

- Headers

```json
{
    "access_token": "string"
}
```

- Body

```json
{
    "firstName": "string",
    "lastName" : "string",
    "address" : "string",
}
```

### Responses:

_200 - OK_

```json
{
    "profile": {
        "id": 5,
        "firstName": "string",
        "lastName": "string",
        "address": "string",
        "currentBalance": "integer",
        "UserId": "integer",
        "createdAt": "date",
        "updatedAt": "date"
    },
    "message": "Profile is successfully updated"
}
```

_(404 - Not Found)_

```json
{
    "message": "Profile Not Found"
}
```


## POST /users/add-balance

### Description

- Top up or add more user balance 

### Request

- Headers

```json
{
    "access_token": "string"
}
```

- Body

```json
{
    "amount": "integer"
}
```

### Responses:

_200 - OK_

```json
{
    "message": "Successfully added balance."
}
```

_(400 - Bad Request)_

```json
{
    "message": "Invalid amount. Amount must be a positive number."
}
```


## GET /menus?maxPrice={value}&sort=-{value}&page[size]={value}&page[number]={value}

### Description

- Show all menus with queries parameters 
- e.g. /menus?maxPrice=35000&sort=-name&page[size]=5&page[number]=2
- sort value is the object's key e.g. name, price etc, use - symbol for descending order.

### Responses:

_200 - OK_

```json
{
    "menus": [
        {
            "id": 27,
            "name": "Teman Makan",
            "price": 15000,
            "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
            "createdAt": "2023-06-06T04:02:05.953Z",
            "updatedAt": "2023-06-06T04:02:05.953Z"
        },
        {
            "id": 17,
            "name": "Sweet Honey Pop Bowl",
            "price": 22000,
            "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
            "createdAt": "2023-06-06T04:02:05.953Z",
            "updatedAt": "2023-06-06T04:02:05.953Z"
        },
        {
            "id": 15,
            "name": "Pop Bowl",
            "price": 22000,
            "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
            "createdAt": "2023-06-06T04:02:05.953Z",
            "updatedAt": "2023-06-06T04:02:05.953Z"
        },
        {
            "id": 16,
            "name": "Nasi Kulit Renyah Idolaku",
            "price": 19400,
            "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
            "createdAt": "2023-06-06T04:02:05.953Z",
            "updatedAt": "2023-06-06T04:02:05.953Z"
        },
        {
            "id": 9,
            "name": "Nasi Ayam Penyet",
            "price": 25500,
            "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
            "createdAt": "2023-06-06T04:02:05.953Z",
            "updatedAt": "2023-06-06T04:02:05.953Z"
        }
    ],
    "currentPage": 1,
    "pageSize": 5,
    "totalCount": 14,
    "totalPages": 3,
    "nextPage": 2
}
```


## POST /menus

### Description

- Create new menu to database by admin
- User's role must be Admin

### Request:

- Headers

```json
{
  "access_token": "string"
}
```

- Body

```json
{
  "name": "string",
  "price": "integer",
  "imageUrl": "string"
}
```

### Responses:

_(201 - Created)_

```json
{
    "createdMenu": {
        "id": 31,
        "name": "Ayam Terang Bulan",
        "price": 45000,
        "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
        "updatedAt": "2023-06-05T18:22:06.621Z",
        "createdAt": "2023-06-05T18:22:06.621Z"
    },
    "message": "Succesfully Added Ayam Terang Bulan Menu!"
}
```

_(400 - Bad Request)_

```json
{
    "message": "Menu's name is required!"
}
OR
{
    "message": "Price is required!"
}
OR
{
    "message": "Menu's image url is required!"
}
```


## GET /menus/:id

### Description

- Get a menu by id

### Request:

- params

```json
{
  "id": "integer"
}
```

### Responses:

_200 - OK_

```json
{
    "id": 4,
    "name": "Moon Chicken Skin",
    "price": 30000,
    "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
    "createdAt": "2023-06-05T17:21:43.235Z",
    "updatedAt": "2023-06-05T17:21:43.235Z"
}
```


## DELETE /menus/:id

### Description

- Delete a menu to database by admin
- User's role must be Admin

### Request:

- Headers

```json
{
  "access_token": "string"
}
```

- params

```json
{
  "id": "integer"
}
```
### Responses:

_(201 - Created)_

```json
{
    "message": "Successfully Removed Ayam Terang Bulan Menu."
}
```

_(404 - Not Found)_

```json
{
    "message": "Menu Not Found"
}
```


## PUT /menus/:id

### Description

- Update a menu to database by admin
- User's role must be Admin

### Request:

- Headers

```json
{
  "access_token": "string"
}
```

- params

```json
{
  "id": "integer"
}
```

- Body

```json
{
  "name": "string",
  "price": "integer",
  "imageUrl": "string"
}
```

### Responses:

_(200 - OK)_

```json
{
    "menu": {
        "id": 31,
        "name": "Ayam Terang Bulan",
        "price": 30000,
        "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webpz",
        "createdAt": "2023-06-06T04:56:56.618Z",
        "updatedAt": "2023-06-06T04:57:51.103Z"
    },
    "message": "Ayam Terang Bulan menu is successfully updated"
}
```

_(400 - Bad Request)_

```json
{
    "message": "Menu's name is required!"
}
OR
{
    "message": "Price is required!"
}
OR
{
    "message": "Menu's image url is required!"
}
```


_(404 - Not Found)_

```json
{
    "message": "Menu Not Found"
}
```


## GET /carts

### Description

- Show user's active cart with status false(not ordered yet)

### Request:

- Headers

```json
{
  "access_token": "string"
}
```

### Responses:

_(200 - OK)_

```json
[
    {
        "id": 2,
        "UserId": 2,
        "totalPrice": 141900,
        "status": false,
        "createdAt": "2023-06-05T19:20:26.592Z",
        "updatedAt": "2023-06-05T19:28:41.842Z",
        "CartItems": [
            {
                "id": 3,
                "CartId": 2,
                "MenuId": 5,
                "quantity": 3,
                "createdAt": "2023-06-05T19:20:26.603Z",
                "updatedAt": "2023-06-05T19:20:26.603Z",
                "Menu": {
                    "id": 5,
                    "name": "Moonbun",
                    "price": 38000,
                    "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
                    "createdAt": "2023-06-05T19:20:26.577Z",
                    "updatedAt": "2023-06-05T19:20:26.577Z"
                }
            },
            {
                "id": 4,
                "CartId": 2,
                "MenuId": 6,
                "quantity": 1,
                "createdAt": "2023-06-05T19:20:26.603Z",
                "updatedAt": "2023-06-05T19:20:26.603Z",
                "Menu": {
                    "id": 6,
                    "name": "Geprek Wangi Nasi Sambal Original",
                    "price": 27900,
                    "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
                    "createdAt": "2023-06-05T19:20:26.577Z",
                    "updatedAt": "2023-06-05T19:20:26.577Z"
                }
            }
        ]
    }
]
```


## POST /carts/:id

### Description

- Add items to user's active cart with status false(not ordered yet)
- Use menu's id as a request params 

### Request:

- Headers

```json
{
  "access_token": "string"
}
```

- params

```json
{
  "id": "integer"
}
```

- Body

```json
{
  "quantity": "integer"
}
```

### Responses:

_(200 - OK)_

```json
{
    "customerCart": {
        "id": 2,
        "UserId": 2,
        "totalPrice": 241900,
        "status": false,
        "createdAt": "2023-06-06T04:02:05.971Z",
        "updatedAt": "2023-06-06T05:25:36.652Z"
    },
    "cartItemAdded": {
        "quantity": 4,
        "id": 12,
        "CartId": 2,
        "MenuId": 28,
        "updatedAt": "2023-06-06T05:25:36.647Z",
        "createdAt": "2023-06-06T05:25:36.608Z"
    },
    "message": "Successfully added 4 Bukan Susu Series to your cart."
}
```

_(404 - Not Found)_

```json
{
    "message": "Menu Not Found"
}
```


## PUT /carts/:id

### Description

- Update item quantity to user's active cart with status false(not ordered yet)
- Use cart item's id as a request params 

### Request:

- Headers

```json
{
  "access_token": "string"
}
```

- params

```json
{
  "id": "integer"
}
```

- Body

```json
{
  "quantity": "integer"
}
```

### Responses:

_(200 - OK)_

```json
{
    "customerCart": {
        "id": 2,
        "UserId": 2,
        "totalPrice": 241900,
        "status": false,
        "createdAt": "2023-06-06T04:02:05.971Z",
        "updatedAt": "2023-06-06T05:25:36.652Z"
    },
    "cartItemAdded": {
        "quantity": 4,
        "id": 12,
        "CartId": 2,
        "MenuId": 28,
        "updatedAt": "2023-06-06T05:25:36.647Z",
        "createdAt": "2023-06-06T05:25:36.608Z"
    },
    "message": "Successfully added 4 Bukan Susu Series to your cart."
}
OR
{
    "message": "No change made to the Bukan Susu Series to item"
}
OR
{
    "message":"Successfully deleted Bukan Susu Series item from cart"
}
```

_(404 - Not Found)_

```json
{
    "message": "Item Not Found"
}
OR
{
    "message": "Cart Not Found"
}
```


## DELETE /carts/:id

### Description

- Delete item from user's active cart with status false(not ordered yet)
- Use cart item's id as a request params 

### Request:

- Headers

```json
{
  "access_token": "string"
}
```

- params

```json
{
  "id": "integer"
}
```

### Responses:

_(200 - OK)_

```json
{
    "message":"Successfully deleted Bukan Susu Series item from cart"
}
```

_(404 - Not Found)_

```json
{
    "message": "Item Not Found"
}
```


## GET /orders

### Description

- Show all user's orders 

### Request:

- Headers

```json
{
  "access_token": "string"
}
```

### Responses:

_(200 - OK)_

```json
[
    {
        "id": 3,
        "UserId": 2,
        "totalPrice": 141900,
        "createdAt": "2023-06-05T18:55:06.159Z",
        "updatedAt": "2023-06-05T18:55:06.159Z",
        "OrderItems": [
            {
                "id": 6,
                "OrderId": 3,
                "MenuId": 5,
                "quantity": 3,
                "createdAt": "2023-06-05T18:55:06.169Z",
                "updatedAt": "2023-06-05T18:55:06.169Z",
                "Menu": {
                    "id": 5,
                    "name": "Moonbun",
                    "price": 38000,
                    "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
                    "createdAt": "2023-06-05T18:53:35.677Z",
                    "updatedAt": "2023-06-05T18:53:35.677Z"
                }
            },
            {
                "id": 7,
                "OrderId": 3,
                "MenuId": 6,
                "quantity": 1,
                "createdAt": "2023-06-05T18:55:06.183Z",
                "updatedAt": "2023-06-05T18:55:06.183Z",
                "Menu": {
                    "id": 6,
                    "name": "Geprek Wangi Nasi Sambal Original",
                    "price": 27900,
                    "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
                    "createdAt": "2023-06-05T18:53:35.677Z",
                    "updatedAt": "2023-06-05T18:53:35.677Z"
                }
            }
        ]
    },
    {
        "id": 4,
        "UserId": 2,
        "totalPrice": 520000,
        "createdAt": "2023-06-05T19:00:43.941Z",
        "updatedAt": "2023-06-05T19:00:43.941Z",
        "OrderItems": [
            {
                "id": 9,
                "OrderId": 4,
                "MenuId": 18,
                "quantity": 10,
                "createdAt": "2023-06-05T19:00:43.954Z",
                "updatedAt": "2023-06-05T19:00:43.954Z",
                "Menu": {
                    "id": 18,
                    "name": "Mozza Dakgalbi Rice",
                    "price": 52000,
                    "imageUrl": "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/IDITE20220602182645089543/detail/f20db8ee_pcriceset.webp",
                    "createdAt": "2023-06-05T18:53:35.677Z",
                    "updatedAt": "2023-06-05T18:53:35.677Z"
                }
            }
        ]
    }
]
```


## POST /orders/:id

### Description

- Check out user's active cart with status false(not ordered yet) to true(ordered)
- Create an order and its items as in carts
- Use user's cart id as a request params 

### Request:

- Headers

```json
{
  "access_token": "string"
}
```

- params

```json
{
  "id": "integer"
}
```

### Responses:

_(201 - Created)_

```json
{
    "message": "The cart has been successfully checked out, and an order has been created."
}
```

_(403 - Forbidden)_

```json
{
    "message": "Insufficient balance. Payment required!"
}
```

_(404 - Not Found)_

```json
{
    "message": "Cart Not Found"
}
```


## Global Error

### Responses:
_(500 - Internal Server Error)_

```json
{
  "message": "Internal server error"
}
```

_(401 - Unauthorized)_

```json
{
  "message": "Invalid Token"
}