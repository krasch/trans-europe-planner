# Trans-Europe-Planner

Making it simpler to plan complex cross-country rail trips in Europe

## Vocabulary used in source code

In the code we need to make the distinction between the abstract way of getting somewhere and 
the specific way of actually getting there.

| Abstract                                                              | Specific                                                                                              |
|-----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| __city__ <br/> _Verona_                                               | __stopover__ <br/>_overnight stay in Verona on 2024-10-14_                                            |
| -                                                                     | __station__ <br/> Verona Puerta Nuova                                                                 |
| __leg__ <br/>_from Verona to Munich_                                  | __connection__ <br/> _the EC87 running from Munich Hbf to Verona Puerta Nuova on 2024-10-14 at 13:34_ |
| __route__ <br/> _[Berlin, Munich, Verona, Florence, Livorno, Bastia]_ | __journey__ <br/> _[ICE505 on 2024-10-14, EC87 on 2024-10-14, ...]_                                   |

* __origin__ The __city__ the user starts from, e.g. __Berlin__
* __destination__ The __city__ the user wants to get to, e.g. __Bastia__
* A __route__ describes one possibility to get from __origin__ to __destination__.
  It lists, in order, the __cities__ (e.g. _[Berlin, Munich, Verona, Florence, Livorno, Bastia]_)
  in which the user has to switch transportations. There usually exist multiple
  possible routes to get from origin to destination.
  A route can also be expressed in natural language, e.g. _from Berlin to Korsika via Verona and Livorno_.
* A __leg__ is formed by taking two subsequent __cities__ in a route. 
  A leg has a __start city__ and an __end city__, e.g. _the leg from Munich to Verona_.
  A leg is only valid if there exists at least one __direct connection__ from __start city__ to __end city__.
* A __connection__ is a specific train/ferry/something that __directly__ fulfills a __leg__.
  A __connection__ runs from a __start station__ to an __end station__. 
  The __start/end stations__ must be located in the __start/end cities__ of the corresponding __leg__.
  A connection is always tied to a __specific date and time__, e.g. _the EC87 running from Munich Hbf to Verona Puerta Nuova on 2024-10-14 at 13:34_.
  There are usually many possible alternative connections that can fulfill a leg.
* A __journey__ is the specific version of a __route__. It lists, in order, all the necessary __connections__ to fulfill the route. 
  There are usually many possible journeys that can fulfill a route.
* A __stopover__ corresponds to the abstract __city__ in which the user has to switch transportation. It is tied
  to a __date/time__ and can be of different types _(e.g. simple switching of trains, overnight stay)_.