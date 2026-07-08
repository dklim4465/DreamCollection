package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.domain.TripLog;
import com.dreamCollection.travelog.dto.request.TripLogRequestDTO;
import com.dreamCollection.travelog.dto.response.TripLogResponseDTO;
import com.dreamCollection.travelog.repository.TripLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Log4j2
public class TripLogServiceImpl implements TripLogService {

    private final ModelMapper modelMapper;

    private final TripLogRepository tripLogRepository;

    private final MediaService mediaService;
    private final SpotService spotService;

    @Override
    public Long registerTrip(TripLogRequestDTO tripLogRequestDTO) {

        TripLog tripLog = modelMapper.map(tripLogRequestDTO, TripLog.class);

        List<String> tags = extract(tripLog.getDescription());

        tags.forEach(tripLog::addTag);

        TripLog result = tripLogRepository.save(tripLog);

        return result.getTno();
    }

    @Override
    public TripLogResponseDTO readTrip(Long tno) {

        Optional<TripLog> result = tripLogRepository.findById(tno);
        TripLog tripLog = result.orElseThrow();

        TripLogResponseDTO tripLogResponseDTO = modelMapper.map(tripLog, TripLogResponseDTO.class);

        return tripLogResponseDTO;
    }

    @Override
    public void updateTrip(Long tno, TripLogRequestDTO tripLogRequestDTO) {

        TripLog tripLog = tripLogRepository.findById(tno).orElseThrow();

        tripLog.changeTitle(tripLogRequestDTO.getTitle());
        tripLog.changeStartDate(tripLogRequestDTO.getStartDate());
        tripLog.changeEndDate(tripLogRequestDTO.getEndDate());
        tripLog.changeDesc(tripLogRequestDTO.getDescription());

        tripLog.clearTags();

        List<String> tags = extract(tripLog.getDescription());

        tags.forEach(tripLog::addTag);


        tripLogRepository.save(tripLog);
    }

    @Override
    @Transactional
    public void removeTrip(Long tno) {

        mediaService.deleteAllByTrip(tno);

        spotService.deleteAllByTrip(tno);

        tripLogRepository.deleteById(tno);
    }

    private static final Pattern PATTERN = Pattern.compile("#[a-zA-Z0-9_가-힣]+");

    public List<String> extract(String text) {
        return PATTERN.matcher(text)
                .results()
                .map(m -> m.group().substring(1))
                .toList();
    }
}
