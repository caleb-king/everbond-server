# EverBond API

## Resources

There are two main resources accessible through the EverBond API:

1) Bonds
2) Interactions

An example bond:
> {<br>
  id: 3 ,<br>
  name: 'Grandma' ,<br>
  birthday: '02/18' ,<br>
  notes:
    'Loves to get hand written letters. Also enjoys Facebook messages.' ,<br>
}

An example interaction:
> {<br>
  id: 7 ,<br>
  bondId: 1 ,<br>
  date: '2020-06-17' ,<br>
  medium: 'Phone Call' ,<br>
  location: '' ,<br>
  description:
  "We reflected on how well Papa's birthday surprise went over." ,<br>
}
## Available Endpoints

### Base URL : `'http//sleepy-bastion-27432.herokuapp.com'`

### Route: `/bonds`

* `GET '/bonds'`
* `POST '/bonds'`

### Route: `/bonds/:bondId`

* `GET '/bonds/:bondId'`
* `PATCH '/bonds/:bondId'`

### Route: `/interactions`

* `GET '/interactions'`
* `POST '/interactions'`

### Route: `/interactions/:interactionId`

* `GET '/interactions/:interactionId'`
* `PATCH '/interactions/:interactionId'`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`