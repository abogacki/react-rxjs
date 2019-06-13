import React from "react";
import { BehaviorSubject, combineLatest, timer } from "rxjs";
import { flatMap, map, debounce } from "rxjs/operators";
import axios from "axios";

const Beers = ({ page, url, beers, onChangePage, onChangeUrl }) => {
  return (
    <div>
      <label>Page</label>
      <br />
      <input
        type="number"
        name="page"
        defaultValue={page}
        onChange={e => onChangePage(e.target.value)}
      />
      <br />
      <label>URL</label>
      <br />
      <input
        type="text"
        name="url"
        defaultValue={url}
        onChange={e => onChangeUrl(e.target.value)}
      />
      <p>
        query:{url} {page}
      </p>
      <p>
        Beers:
        <ul>
          {beers &&
            beers.length > 0 &&
            beers.map(b => (
              <li>
                {b.name}, {b.tagline}
              </li>
            ))}
        </ul>
      </p>
    </div>
  );
};

const page$ = new BehaviorSubject(1);
const url$ = new BehaviorSubject("https://api.punkapi.com/v2/beers");

const fetch$ = combineLatest(url$, page$).pipe(
  debounce(() => timer(1000)),
  flatMap(([url, page]) => {
    return axios({ url, params: { page, per_page: 3 } });
  }),
  map(result => result.data)
);

const withObservableStream = (
  observable,
  triggers,
  initialState
) => Component => {
  return class extends React.Component {
    constructor() {
      super();
      this.state = {
        ...initialState
      };
    }
    componentDidMount() {
      this.subscription = observable.subscribe(([page, url, beers]) => {
        this.setState({ page, url, beers });
      });
    }

    componentWillUnmount() {
      this.subscription.unsubscribe();
    }

    render() {
      console.log(this.state);

      return <Component {...this.props} {...this.state} {...triggers} />;
    }
  };
};

export default withObservableStream(
  combineLatest(page$, url$, fetch$),
  (page, url, fetchUrl) => ({ page, url, fetchUrl }),
  {
    onChangePage: page => {
      return page$.next(Number(page || 1));
    },
    onChangeUrl: url => url$.next(url)
  }
)(Beers);
