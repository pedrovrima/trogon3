
library("tidyverse")
library("lubridate")

band_report = read_csv('./data_management/bands_1708379032282.csv') 
cemave_report = read_csv('./data_management/relatorio_cemave.csv')%>%mutate(reported=!is.na(reported))

band_report%>%filter(bandNumber=='C75191')

full_report = left_join(cemave_report, band_report, by=c('band_number'='bandNumber'))

notOnTrogon = full_report%>%filter(is.na(captures))

## De quando sao essas anilhas?
notOnTrogon%>%group_by(distribution)%>%summarize(n=n())
## 1 anilha nao esta no Trogon, de 19/05/2022
## 600 anilhas nao estao no Trogon, de 21/12/2023

notReportedWithCaptures = full_report%>%filter(!reported &  captures>0)%>%select(band_number)%>%unlist()


onTrogonNotInCemave = band_report%>%left_join(cemave_report, by=c('bandNumber'='band_number'))%>%filter(is.na(size))


CBRO2011 <- read_csv("./data_management/CBRO2011.csv")%>%mutate(NOME.CIENTIFICO=Taxon, CBRO=T)%>%select(NOME.CIENTIFICO,CBRO)

## Formating data to report
aDATA <- read_csv("./data_management/captures_1716860217956.csv") %>% mutate(datanew = format(as.Date(data, format = "%Y-%m-%d"), format = "%d/%m/%Y"))


############### SISBIO #################

SIS_DATA <-aDATA%>%filter(data>=mdy('06/01/2023') & data<=mdy('04/01/2024'))

# Calculate the earliest date in the data
earliest_date <- min(SIS_DATA$data)

# Create a sequence of dates for the 3-month bins
date_bins <- seq(earliest_date, by = "90 days", length.out = 4)

# Create a list to store the results
results <- list()

# Iterate over the date bins
for (i in 1:(length(date_bins)-1)) {
  # Filter the data for the current date bin
  current_bin <- aDATA %>% filter(data >= date_bins[i] & data < date_bins[i+1])
  
  # Calculate the number of rows with status == "X"
  deaths <- current_bin %>% filter(status == "X") %>% nrow()
  
  # Calculate the number of rows with status != "X"
  new <- current_bin %>% filter(captureCode=='N' & status != "X") %>% nrow()
  

  # Store the results in the list
  results[[i]] <- list(date_bin = paste(date_bins[i], date_bins[i+1], sep = " - "),
                      deaths = deaths,
                      new = new)
}

# Print the results
results_table <- bind_rows(results)
results_table







############### CEMAVE ################
DATA=aDATA%>%filter(data>mdy('02/28/2024'))







###Alterando o nome da coluna no CBRO2011
colnames(CBRO2011)[colnames(CBRO2011) == "NOME.CIENTIFICO"] <- "sppName"


## Put data in CEMAVE shape
DCEMAVE<-DATA%>%mutate(sex=ifelse(sex=="U","I",sex),IDADE.CEMAVE=ifelse(grepl("FC",age_wrp)|grepl("FP",age_wrp),"J",ifelse(grepl("UC",age_wrp)|grepl("UP",age_wrp)|is.na(age_wrp),"D","A")), location=substr(station,1,3)) %>% 
  select(station, location,captureCode,bandSize, bandNumber, sppName, age_wrp, sex, IDADE.CEMAVE,datanew) %>% left_join(CBRO2011)


DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Heliodoxa rubricauda"), "sppName"] <- "Clytolaema rubricauda" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Vireo chivi"), "sppName"] <- "Vireo olivaceus" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Microspingus lateralis"), "sppName"] <- "Poospiza lateralis" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Rhopias gularis"), "sppName"] <- "Myrmotherula gularis" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Myiothlypis leucoblephara"), "sppName"] <- "Basileuterus leucoblepharus" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Trichothraupis melanops"), "sppName"] <- "Lanio melanops" 




## Splitting data into different banding types
DCEMAVE_RECAP <- DCEMAVE%>%filter(captureCode=="R")%>%mutate("Código da Anilha" = bandSize, "Número da Anilha" = bandNumber, "Espécies" = sppName, "Código da Idade" = IDADE.CEMAVE, "Código do Sexo"=sex, "Data"=datanew, "Diâmetro do Tarso" = "", Observações = "")

DCEMAVE_DEST <- DCEMAVE%>%filter(captureCode=="D" | sppName=="Anilhus destruidus")%>%mutate(captureCode="D", IDADE.CEMAVE=NA)%>%mutate("Código da Anilha" = bandSize, "Número da Anilha" = bandNumber, "Espécies" = sppName, "Código da Idade" = IDADE.CEMAVE, "Código do Sexo"=sex, "Data"=datanew, "Diâmetro do Tarso" = "", Observações = "")

DCEMAVE_PERD <- DCEMAVE%>%filter(captureCode=="P" | sppName=="Anilhus perdidus")%>%mutate(captureCode="P", IDADE.CEMAVE=NA)%>%mutate("Código da Anilha" = bandSize, "Número da Anilha" = bandNumber, "Espécies" = sppName, "Código da Idade" = IDADE.CEMAVE, "Código do Sexo"=sex, "Data"=datanew, "Diâmetro do Tarso" = "", Observações = "")

DCEMAVE_NOVO <- DCEMAVE%>%filter(captureCode=="N" &  bandSize!='U' & sppName!="Anilhus destruidus" & sppName!="Anilhus perdidus")%>%mutate("Código da Anilha" = bandSize, "Número da Anilha" = bandNumber, "Espécies" = sppName, "Código da Idade" = IDADE.CEMAVE, "Código do Sexo"=sex, "Data"=datanew, "Diâmetro do Tarso" = "", Observações = "")



### Check if there is any species that is not in CBRO2011
DCEMAVE_NOVO %>%select(sppName,CBRO) %>% filter(is.na(CBRO))%>% unique()

## Correcting names

DCEMAVE_NOVO=DCEMAVE_NOVO%>%mutate(location=ifelse(location=='BBF', 'BOA', location))
## Create folder
dirName = paste0("./RELATORIO_MAR2024-JUN2024")
dir.create(dirName)
dir.create(paste0(dirName,"/N"))

## Saving tables


split_and_save <- function(df, location_name, dir_name) {
  chunks <- split(df, ceiling(seq_along(df$`Código da Anilha`) / 300))
  walk2(chunks, seq_along(chunks), function(chunk, i) {
    file_name <- paste0(dir_name, "/N/", location_name, "_part", i, ".csv")
    write_csv2(chunk, file_name)
  })
}

DCEMAVE_NOVO %>%
  group_by(location) %>%
  group_split() %>%
  walk(function(df) {
    location_name <- unique(df$location)[1]
    df <- select(df, "Código da Anilha", "Número da Anilha", "Espécies", "Código da Idade", "Código do Sexo", "Data", "Diâmetro do Tarso",  "Observações")
    split_and_save(df, location_name, dirName)
  })

